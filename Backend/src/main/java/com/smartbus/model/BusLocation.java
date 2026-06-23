package com.smartbus.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "bus_locations")
public class BusLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_id")
    private Long busId;

    private Double latitude;

    private Double longitude;

    @Column(name = "last_updated")
    private ZonedDateTime lastUpdated;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public ZonedDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(ZonedDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
