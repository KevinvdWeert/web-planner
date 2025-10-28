<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to avoid breaking JSON

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

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

class EventController {
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

    public function getEvents() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    title,
                    description,
                    DATE(start_datetime) as date,
                    TIME(start_datetime) as time,
                    location,
                    CASE 
                        WHEN title LIKE '%meeting%' OR title LIKE '%Meeting%' THEN 'meeting'
                        WHEN title LIKE '%deadline%' OR title LIKE '%Deadline%' THEN 'deadline'
                        WHEN title LIKE '%reminder%' OR title LIKE '%Reminder%' THEN 'reminder'
                        WHEN title LIKE '%appointment%' OR title LIKE '%Appointment%' THEN 'appointment'
                        ELSE 'personal'
                    END as type,
                    color,
                    start_datetime,
                    end_datetime,
                    created_at,
                    updated_at
                FROM events 
                WHERE user_id = ? 
                ORDER BY start_datetime ASC
            ");
            $stmt->execute([$this->userId]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $events
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function createEvent($data) {
        try {
            // Validate required fields
            if (empty($data['title']) || empty($data['date'])) {
                throw new Exception('Event title and date are required');
            }

            // Build datetime from date and time
            $startDateTime = $data['date'];
            if (!empty($data['time'])) {
                $startDateTime .= ' ' . $data['time'];
            } else {
                $startDateTime .= ' 00:00:00';
            }
            
            // Default end time (1 hour later)
            $endDateTime = date('Y-m-d H:i:s', strtotime($startDateTime . ' +1 hour'));
            
            // Get color based on type
            $colorMap = [
                'meeting' => '#3b82f6',
                'deadline' => '#ef4444',
                'reminder' => '#f59e0b',
                'appointment' => '#10b981',
                'personal' => '#8b5cf6'
            ];
            $color = $colorMap[$data['type'] ?? 'meeting'] ?? '#3b82f6';
            
            $stmt = $this->db->prepare("
                INSERT INTO events (user_id, title, description, start_datetime, end_datetime, location, color) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $this->userId,
                $data['title'],
                $data['description'] ?? '',
                $startDateTime,
                $endDateTime,
                $data['location'] ?? '',
                $color
            ]);

            $eventId = $this->db->lastInsertId();
            
            // Return the created event in the expected format
            $event = [
                'id' => $eventId,
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'date' => $data['date'],
                'time' => $data['time'] ?? '',
                'location' => $data['location'] ?? '',
                'type' => $data['type'] ?? 'meeting',
                'color' => $color,
                'start_datetime' => $startDateTime,
                'end_datetime' => $endDateTime
            ];

            echo json_encode([
                'success' => true,
                'message' => 'Event created successfully',
                'event' => $event
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function updateEvent($id, $data) {
        try {
            // Validate required fields
            if (empty($data['title']) || empty($data['date'])) {
                throw new Exception('Event title and date are required');
            }

            // Check if event exists and belongs to user
            $checkStmt = $this->db->prepare("SELECT id FROM events WHERE id = ? AND user_id = ?");
            $checkStmt->execute([$id, $this->userId]);
            if (!$checkStmt->fetch()) {
                throw new Exception('Event not found or access denied');
            }

            // Build datetime from date and time
            $startDateTime = $data['date'];
            if (!empty($data['time'])) {
                $startDateTime .= ' ' . $data['time'];
            } else {
                $startDateTime .= ' 00:00:00';
            }
            
            // Default end time (1 hour later)
            $endDateTime = date('Y-m-d H:i:s', strtotime($startDateTime . ' +1 hour'));
            
            // Get color based on type
            $colorMap = [
                'meeting' => '#3b82f6',
                'deadline' => '#ef4444',
                'reminder' => '#f59e0b',
                'appointment' => '#10b981',
                'personal' => '#8b5cf6'
            ];
            $color = $colorMap[$data['type'] ?? 'meeting'] ?? '#3b82f6';
            
            $stmt = $this->db->prepare("
                UPDATE events 
                SET title = ?, description = ?, start_datetime = ?, end_datetime = ?, location = ?, color = ?
                WHERE id = ? AND user_id = ?
            ");
            
            $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                $startDateTime,
                $endDateTime,
                $data['location'] ?? '',
                $color,
                $id,
                $this->userId
            ]);

            // Return the updated event in the expected format
            $event = [
                'id' => (int)$id,
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'date' => $data['date'],
                'time' => $data['time'] ?? '',
                'location' => $data['location'] ?? '',
                'type' => $data['type'] ?? 'meeting',
                'color' => $color,
                'start_datetime' => $startDateTime,
                'end_datetime' => $endDateTime
            ];

            echo json_encode([
                'success' => true,
                'message' => 'Event updated successfully',
                'event' => $event
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function deleteEvent($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM events WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $this->userId]);

            echo json_encode([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}

$controller = new EventController();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        $controller->getEvents();
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
        
        $controller->createEvent($data);
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
            $controller->updateEvent($data['id'], $data);
        } elseif ($id) {
            $controller->updateEvent($id, $data);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Event ID is required'
            ]);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            $controller->deleteEvent($id);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Event ID is required'
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