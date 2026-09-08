package com.example.tablebooking.exception;

public record ErrorResponse(int status, String error, String message) {
}