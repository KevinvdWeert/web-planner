<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to avoid breaking JSON

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/auth.php';
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Configuration error: ' . $e->getMessage()
    ]);
    exit;
}

class TaskController {
    private $db;
    private $auth;

    public function __construct() {
        $this->auth = new Auth();
        $userId = $this->auth->checkAuth();
        
        if (!$userId) {
            echo json_encode([
                'success' => false,
                'message' => 'Authentication required'
            ]);
            exit;
        }

        $database = new Database();
        $this->db = $database->getConnection();
        $this->userId = $userId;
    }

    public function getTasks() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$this->userId]);
            $tasks = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $tasks
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function getTask($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $this->userId]);
            $task = $stmt->fetch();
            
            if ($task) {
                echo json_encode([
                    'success' => true,
                    'data' => $task
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Task not found'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function createTask($data) {
        try {
            // Validate required fields
            if (empty($data['title'])) {
                throw new Exception('Task title is required');
            }

            $stmt = $this->db->prepare("
                INSERT INTO tasks (user_id, title, description, due_date, due_time, priority, category, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $this->userId,
                $data['title'],
                $data['description'] ?? '',
                !empty($data['due_date']) ? $data['due_date'] : null,
                !empty($data['due_time']) ? $data['due_time'] : null,
                $data['priority'] ?? 'medium',
                $data['category'] ?? 'work',
                $data['status'] ?? 'todo'
            ]);

            $taskId = $this->db->lastInsertId();
            
            // Return the created task
            $stmt = $this->db->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$taskId]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Task created successfully',
                'task' => $task
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function updateTask($id, $data) {
        try {
            // Validate required fields
            if (empty($data['title'])) {
                throw new Exception('Task title is required');
            }

            // Check if task exists and belongs to user
            $checkStmt = $this->db->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
            $checkStmt->execute([$id, $this->userId]);
            if (!$checkStmt->fetch()) {
                throw new Exception('Task not found or access denied');
            }

            $stmt = $this->db->prepare("
                UPDATE tasks 
                SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?, category = ?, status = ?
                WHERE id = ? AND user_id = ?
            ");
            
            $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                !empty($data['due_date']) ? $data['due_date'] : null,
                !empty($data['due_time']) ? $data['due_time'] : null,
                $data['priority'] ?? 'medium',
                $data['category'] ?? 'work',
                $data['status'] ?? 'todo',
                $id,
                $this->userId
            ]);

            // Return the updated task
            $stmt = $this->db->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Task updated successfully',
                'task' => $task
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function deleteTask($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $this->userId]);

            echo json_encode([
                'success' => true,
                'message' => 'Task deleted successfully'
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}

$controller = new TaskController();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $controller->getTask($id);
        } else {
            $controller->getTasks();
        }
        break;
    
    case 'POST':
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data'
            ]);
            break;
        }
        
        $controller->createTask($data);
        break;
    
    case 'PUT':
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data'
            ]);
            break;
        }
        
        if (!empty($data['id'])) {
            $controller->updateTask($data['id'], $data);
        } elseif ($id) {
            $controller->updateTask($id, $data);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Task ID is required'
            ]);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            $controller->deleteTask($id);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Task ID is required'
            ]);
        }
        break;
    
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}
?>