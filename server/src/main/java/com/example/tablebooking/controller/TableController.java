package com.example.tablebooking.controller;

import com.example.tablebooking.dto.CreateTableRequest;
import com.example.tablebooking.dto.TableResponse;
import com.example.tablebooking.service.TableService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @PostMapping
    public ResponseEntity<TableResponse> create(@Valid @RequestBody CreateTableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.create(request));
    }

    @GetMapping
    public List<TableResponse> findAll() {
        return tableService.findAll();
    }
}