package com.example.tablebooking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateTableRequest(
        @NotNull @Positive Integer tableNumber,
        @NotNull @Positive Integer capacity) {
}