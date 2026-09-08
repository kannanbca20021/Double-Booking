package com.example.tablebooking.exception;

public class BookingConflictException extends RuntimeException {

    public BookingConflictException(String message) {
        super(message);
    }
}