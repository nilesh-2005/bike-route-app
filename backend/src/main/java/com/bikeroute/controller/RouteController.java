package com.bikeroute.controller;

import com.bikeroute.dto.RouteResponse;
import com.bikeroute.service.RouteService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping(value = "/route", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getRoute(
            @RequestParam double fromLat,
            @RequestParam double fromLng,
            @RequestParam double toLat,
            @RequestParam double toLng) {
        
        try {
            RouteResponse response = routeService.getRoute(fromLat, fromLng, toLat, toLng);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Routing failed: " + e.getMessage()); 
        }
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        return ResponseEntity.status(500).body(java.util.Collections.singletonMap("message", e.getMessage()));
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
