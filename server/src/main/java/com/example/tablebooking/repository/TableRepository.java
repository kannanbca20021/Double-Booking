package com.example.tablebooking.repository;

import com.example.tablebooking.entity.Table;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TableRepository extends JpaRepository<Table, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select table from DiningTable table where table.id = :id")
    Optional<Table> findByIdForUpdate(@Param("id") Long id);
}