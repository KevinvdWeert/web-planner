<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$auth = new Auth();

// Allow login with either username or email
$identifier = $input['username'] ?? $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($identifier) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username/email and password are required']);
    exit();
}

$result = $auth->login($identifier, $password);
echo json_encode($result);
?>