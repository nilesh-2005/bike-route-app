package com.bikeroute.dto;

import java.util.List;

/**
 * DTO for route response containing distance, time and points.
 */
public class RouteResponse {
    
    private double distance; // meters
    private long time; // milliseconds
    private List<double[]> points; // List of [lat, lon] arrays
    
    public RouteResponse() {}
    
    public RouteResponse(double distance, long time, List<double[]> points) {
        this.distance = distance;
        this.time = time;
        this.points = points;
    }
    
    public double getDistance() {
        return distance;
    }
    
    public void setDistance(double distance) {
        this.distance = distance;
    }
    
    public long getTime() {
        return time;
    }
    
    public void setTime(long time) {
        this.time = time;
    }
    
    public List<double[]> getPoints() {
        return points;
    }
    
    public void setPoints(List<double[]> points) {
        this.points = points;
    }
    
    // Convenience methods for display
    public double getDistanceKm() {
        return distance / 1000.0;
    }
    
    public double getTimeMinutes() {
        return time / 60000.0;
    }
}
