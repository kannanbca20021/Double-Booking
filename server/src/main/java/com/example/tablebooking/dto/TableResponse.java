package com.example.tablebooking.dto;

import com.example.tablebooking.entity.Table;

public record TableResponse(Long id, Integer tableNumber, Integer capacity) {

    public static TableResponse from(Table table) {
        return new TableResponse(table.getId(), table.getTableNumber(), table.getCapacity());
    }
}