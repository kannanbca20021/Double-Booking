package com.example.tablebooking.dto;

import com.example.tablebooking.entity.Booking;
import com.example.tablebooking.entity.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        Long tableId,
        String customerName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        BookingStatus status) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getTableId(),
                booking.getCustomerName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus());
    }
}