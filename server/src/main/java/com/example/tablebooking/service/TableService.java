package com.example.tablebooking.service;

import com.example.tablebooking.dto.CreateTableRequest;
import com.example.tablebooking.dto.TableResponse;
import com.example.tablebooking.entity.Table;
import com.example.tablebooking.repository.TableRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;

    @Transactional
    public TableResponse create(CreateTableRequest request) {
        Table table = new Table(null, request.tableNumber(), request.capacity());
        return TableResponse.from(tableRepository.save(table));
    }

    @Transactional(readOnly = true)
    public List<TableResponse> findAll() {
        return tableRepository.findAll().stream()
                .map(TableResponse::from)
                .toList();
    }
}