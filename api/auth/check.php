<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$auth = new Auth();
$user = $auth->getCurrentUser();

if ($user) {
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'user' => $user
    ]);
} else {
    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'message' => 'Not authenticated'
    ]);
}
?>