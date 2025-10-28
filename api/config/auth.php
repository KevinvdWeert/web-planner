<?php
// Start session only if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class Database {
    private $host = 'localhost';
    private $dbname = 'web_planner';
    private $username = 'root';
    private $password = '';
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed. Please check your configuration.");
        }
    }

    public function getConnection() {
        return $this->pdo;
    }
}

class Auth {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function register($username, $password, $email = null) {
        try {
            // Check if username already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'Username already exists'];
            }

            // Hash password and create user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
            $stmt->execute([$username, $hashedPassword, $email]);

            return ['success' => true, 'message' => 'User created successfully', 'user_id' => $this->db->lastInsertId()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function login($identifier, $password) {
        try {
            // Check if identifier is an email or username
            $stmt = $this->db->prepare("SELECT id, username, password FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$identifier, $identifier]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Create session
                $sessionId = bin2hex(random_bytes(32));
                $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                $stmt = $this->db->prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)");
                $stmt->execute([$sessionId, $user['id'], $expiresAt]);

                $_SESSION['session_id'] = $sessionId;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];

                // Get full user data for response
                $stmt = $this->db->prepare("SELECT id, username, email FROM users WHERE id = ?");
                $stmt->execute([$user['id']]);
                $fullUser = $stmt->fetch();

                return [
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $fullUser ?: [
                        'id' => $user['id'],
                        'username' => $user['username']
                    ],
                    'session_id' => $sessionId
                ];
            } else {
                return ['success' => false, 'message' => 'Invalid username or password'];
            }
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Login failed. Please try again.'];
        }
    }

    public function logout() {
        try {
            if (isset($_SESSION['session_id'])) {
                $stmt = $this->db->prepare("DELETE FROM sessions WHERE id = ?");
                $stmt->execute([$_SESSION['session_id']]);
            }
            
            session_destroy();
            return ['success' => true, 'message' => 'Logged out successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function checkAuth() {
        if (!isset($_SESSION['session_id']) || !isset($_SESSION['user_id'])) {
            return false;
        }

        try {
            $stmt = $this->db->prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > NOW()");
            $stmt->execute([$_SESSION['session_id']]);
            $session = $stmt->fetch();

            if ($session && $session['user_id'] == $_SESSION['user_id']) {
                return $_SESSION['user_id'];
            } else {
                // Clean up invalid session
                if (session_status() === PHP_SESSION_ACTIVE) {
                    session_destroy();
                }
                return false;
            }
        } catch (Exception $e) {
            error_log("Auth check error: " . $e->getMessage());
            return false;
        }
    }

    public function getCurrentUser() {
        $userId = $this->checkAuth();
        if (!$userId) {
            return null;
        }

        try {
            $stmt = $this->db->prepare("SELECT id, username, email FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            // Ensure we return the user data or null
            return $user ?: null;
        } catch (Exception $e) {
            error_log("getCurrentUser error: " . $e->getMessage());
            return null;
        }
    }
}
?>