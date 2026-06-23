package com.smartbus.repository;

import com.smartbus.model.BusLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusLocationRepository extends JpaRepository<BusLocation, Long> {
    Optional<BusLocation> findByBusId(Long busId);
}
