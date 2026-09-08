package com.example.tablebooking.exception;

public class TableNotFoundException extends RuntimeException {

    public TableNotFoundException(Long tableId) {
        super("Table " + tableId + " was not found");
    }
}