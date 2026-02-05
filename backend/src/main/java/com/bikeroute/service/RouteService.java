package com.bikeroute.service;

import com.bikeroute.dto.RouteResponse;
import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.util.PointList;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    private final GraphHopper graphHopper;

    public RouteService(GraphHopper graphHopper) {
        this.graphHopper = graphHopper;
    }

    /**
     * Calculate a bike route between two points.
     * @return RouteResponse with distance (meters), time (ms), and points as [lat, lon] arrays
     */
    public RouteResponse getRoute(double fromLat, double fromLng, double toLat, double toLng) {
        GHRequest req = new GHRequest(fromLat, fromLng, toLat, toLng);
        req.setProfile("bike_custom");
        req.setLocale("en");

        GHResponse rsp = graphHopper.route(req);

        if (rsp.hasErrors()) {
            throw new RuntimeException("Routing failed: " + rsp.getErrors().toString());
        }

        ResponsePath path = rsp.getBest();

        // Extract points as [lat, lon] arrays
        List<double[]> points = new ArrayList<>();
        PointList pointList = path.getPoints();
        for (int i = 0; i < pointList.size(); i++) {
            points.add(new double[]{pointList.getLat(i), pointList.getLon(i)});
        }

        return new RouteResponse(
            path.getDistance(),
            path.getTime(),
            points
        );
    }
}
