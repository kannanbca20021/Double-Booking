package com.example.tablebooking.repository;

import com.example.tablebooking.entity.Booking;
import com.example.tablebooking.entity.BookingStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select booking from Booking booking
            where booking.tableId = :tableId
              and booking.bookingDate = :bookingDate
              and booking.status = :status
            """)
    List<Booking> findByTableAndDateForUpdate(
            @Param("tableId") Long tableId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("status") BookingStatus status);
}