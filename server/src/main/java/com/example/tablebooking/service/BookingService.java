package com.example.tablebooking.service;

import com.example.tablebooking.dto.BookingResponse;
import com.example.tablebooking.dto.CreateBookingRequest;
import com.example.tablebooking.entity.Booking;
import com.example.tablebooking.entity.BookingStatus;
import com.example.tablebooking.entity.Table;
import com.example.tablebooking.exception.BookingConflictException;
import com.example.tablebooking.exception.TableNotFoundException;
import com.example.tablebooking.repository.BookingRepository;
import com.example.tablebooking.repository.TableRepository;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final BookingRepository bookingRepository;
    private final TableRepository tableRepository;

    @Transactional
    public BookingResponse create(CreateBookingRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        Table table = tableRepository.findByIdForUpdate(request.tableId())
                .orElseThrow(() -> new TableNotFoundException(request.tableId()));

        List<Booking> existingBookings = bookingRepository.findByTableAndDateForUpdate(
                request.tableId(), request.bookingDate(), BookingStatus.CONFIRMED);

        existingBookings.stream()
                .filter(existing -> overlaps(
                        existing.getStartTime(),
                        existing.getEndTime(),
                        request.startTime(),
                        request.endTime()))
                .findFirst()
                .ifPresent(existing -> {
                    throw new BookingConflictException(String.format(
                            "Table %d is already booked from %s to %s on %s",
                            table.getTableNumber(),
                            existing.getStartTime().format(TIME_FORMATTER),
                            existing.getEndTime().format(TIME_FORMATTER),
                            request.bookingDate()));
                });

        Booking booking = new Booking(
                null,
                request.tableId(),
                request.customerName(),
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                BookingStatus.CONFIRMED);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingRepository.findAll().stream()
                .map(BookingResponse::from)
                .toList();
    }

    static boolean overlaps(
            LocalTime existingStart,
            LocalTime existingEnd,
            LocalTime newStart,
            LocalTime newEnd) {
        return existingStart.isBefore(newEnd) && existingEnd.isAfter(newStart);
    }
}