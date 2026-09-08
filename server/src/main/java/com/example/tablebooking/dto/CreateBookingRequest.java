package com.example.tablebooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateBookingRequest(
        @NotNull @Positive Long tableId,
        @NotBlank String customerName,
        @NotNull LocalDate bookingDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime) {
}