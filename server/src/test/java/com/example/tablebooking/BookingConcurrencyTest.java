package com.example.tablebooking;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.example.tablebooking.dto.CreateBookingRequest;
import com.example.tablebooking.entity.Table;
import com.example.tablebooking.repository.BookingRepository;
import com.example.tablebooking.repository.TableRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class BookingConcurrencyTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TableRepository tableRepository;

    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private Long tableId;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        tableRepository.deleteAll();
        tableId = tableRepository.save(new Table(null, 5, 4)).getId();
    }

    @AfterEach
    void tearDown() {
        executor.shutdownNow();
    }

    @Test
    void onlyOneOfTwoConcurrentOverlappingRequestsSucceeds() throws Exception {
        CreateBookingRequest request = new CreateBookingRequest(
                tableId,
                "Alex",
                LocalDate.of(2026, 9, 8),
                LocalTime.of(18, 0),
                LocalTime.of(19, 0));
        String requestBody = objectMapper.writeValueAsString(request);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Callable<MvcResult> createBooking = () -> {
            ready.countDown();
            if (!start.await(5, SECONDS)) {
                throw new IllegalStateException("Timed out waiting to start concurrent requests");
            }
            return mockMvc.perform(post("/api/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andReturn();
        };

        Future<MvcResult> first = executor.submit(createBooking);
        Future<MvcResult> second = executor.submit(createBooking);
        assertThat(ready.await(5, SECONDS)).isTrue();
        start.countDown();

        MvcResult firstResult = first.get(10, SECONDS);
        MvcResult secondResult = second.get(10, SECONDS);
        List<Integer> statuses = List.of(
                        firstResult.getResponse().getStatus(),
                        secondResult.getResponse().getStatus())
                .stream()
                .sorted()
                .toList();

        assertThat(statuses).containsExactly(201, 409);
        assertThat(bookingRepository.count()).isEqualTo(1);

        MvcResult conflictResult = firstResult.getResponse().getStatus() == 409 ? firstResult : secondResult;
        assertThat(conflictResult.getResponse().getContentAsString())
                .contains("Table 5 is already booked from 18:00 to 19:00 on 2026-09-08");
    }
}