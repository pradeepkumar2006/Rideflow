package com.smartbus.controller;

import com.smartbus.model.Bus;
import com.smartbus.model.BusLocation;
import com.smartbus.repository.BusLocationRepository;
import com.smartbus.repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/buses")
public class BusController {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private BusLocationRepository busLocationRepository;

    public static class StartTripRequest {
        public String route;
        public String numberPlate;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startTrip(@RequestBody StartTripRequest request) {
        // 1. Create Bus
        Bus bus = new Bus();
        bus.setBusName("Route " + request.route);
        bus.setNumberPlate(request.numberPlate != null ? request.numberPlate : "TN-00-0000");
        bus.setCapacity(50);
        bus.setStatus("Running");
        bus = busRepository.save(bus);

        // 2. Create Initial Location
        BusLocation location = new BusLocation();
        location.setBusId(bus.getId());
        location.setLatitude(13.0827); // Default Chennai
        location.setLongitude(80.2707);
        location = busLocationRepository.save(location);

        // 3. Return IDs
        Map<String, Object> response = new HashMap<>();
        response.put("busId", bus.getId());
        response.put("locationId", location.getId());

        return ResponseEntity.ok(response);
    }

    public static class LocationUpdateRequest {
        public Double latitude;
        public Double longitude;
    }

    @PutMapping("/{locationId}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long locationId, @RequestBody LocationUpdateRequest request) {
        Optional<BusLocation> optionalLocation = busLocationRepository.findById(locationId);
        
        if (optionalLocation.isPresent()) {
            BusLocation location = optionalLocation.get();
            location.setLatitude(request.latitude);
            location.setLongitude(request.longitude);
            location.setLastUpdated(ZonedDateTime.now());
            
            // FUTURE: ETA Calculation Logic could go here before saving!
            
            busLocationRepository.save(location);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
