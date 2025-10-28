<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/auth.php';

$auth = new Auth();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['action'] ?? '';

        switch ($action) {
            case 'register':
                if (empty($input['username']) || empty($input['password'])) {
                    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
                    break;
                }
                
                $result = $auth->register($input['username'], $input['password'], $input['email'] ?? null);
                echo json_encode($result);
                break;

            case 'login':
                if (empty($input['username']) || empty($input['password'])) {
                    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
                    break;
                }
                
                $result = $auth->login($input['username'], $input['password']);
                
                // Ensure user data is included in successful login
                if ($result['success'] && !isset($result['user'])) {
                    $user = $auth->getCurrentUser();
                    if ($user) {
                        $result['user'] = $user;
                    }
                }
                
                echo json_encode($result);
                break;

            case 'logout':
                $result = $auth->logout();
                echo json_encode($result);
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;

    case 'GET':
        $action = $_GET['action'] ?? '';

        switch ($action) {
            case 'check':
                $user = $auth->getCurrentUser();
                if ($user) {
                    echo json_encode([
                        'success' => true,
                        'authenticated' => true,
                        'user' => [
                            'id' => $user['id'],
                            'username' => $user['username'],
                            'email' => $user['email']
                        ]
                    ]);
                } else {
                    echo json_encode([
                        'success' => true,
                        'authenticated' => false,
                        'user' => null
                    ]);
                }
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>