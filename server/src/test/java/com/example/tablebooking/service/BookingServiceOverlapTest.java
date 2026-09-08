package com.example.tablebooking.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class BookingServiceOverlapTest {

    @Test
    void exactOverlap() {
        assertTrue(BookingService.overlaps(time("18:00"), time("19:00"), time("18:00"), time("19:00")));
    }

    @Test
    void partialOverlap() {
        assertTrue(BookingService.overlaps(time("18:00"), time("19:00"), time("18:30"), time("19:30")));
    }

    @Test
    void adjacentSlotsDoNotOverlap() {
        assertFalse(BookingService.overlaps(time("18:00"), time("19:00"), time("19:00"), time("20:00")));
    }

    @Test
    void fullyContainedSlotOverlaps() {
        assertTrue(BookingService.overlaps(time("18:00"), time("20:00"), time("18:30"), time("19:00")));
    }

    private LocalTime time(String value) {
        return LocalTime.parse(value);
    }
}