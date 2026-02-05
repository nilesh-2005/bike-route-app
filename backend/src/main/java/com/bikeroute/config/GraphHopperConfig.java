package com.bikeroute.config;

import com.graphhopper.GraphHopper;
import com.graphhopper.config.CHProfile;
import com.graphhopper.config.LMProfile;
import com.graphhopper.config.Profile;
import com.graphhopper.util.CustomModel;
import com.graphhopper.json.Statement;
import com.graphhopper.util.JsonFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Configuration
public class GraphHopperConfig {

    @Value("${graphhopper.osm-path:data/india-latest.osm.pbf}")
    private String osmPath;

    @Value("${graphhopper.graph-location:graph-cache}")
    private String graphLocation;

    @Bean
    public GraphHopper graphHopper() throws IOException {
        GraphHopper hopper = new GraphHopper();
        
        // OSM File
        hopper.setOSMFile(osmPath);
        hopper.setGraphHopperLocation(graphLocation);
        
        // Profile setup
        ObjectMapper objectMapper = new ObjectMapper();
        
        CustomModel customModel;
        try {
            // Load from classpath (works in JAR)
            java.io.InputStream is = getClass().getClassLoader().getResourceAsStream("custom_bike.json");
            if (is != null) {
                customModel = objectMapper.readValue(is, CustomModel.class);
                is.close();
            } else {
                // Fallback: create a basic custom model with required speed statement
                customModel = new CustomModel();
                customModel.setDistanceInfluence(15.0);
                // REQUIRED: At least one speed statement
                customModel.addToSpeed(Statement.If("true", Statement.Op.LIMIT, "25"));
            }
        } catch (Exception e) {
            // Fallback in case of any error
            customModel = new CustomModel();
            customModel.setDistanceInfluence(15.0);
            customModel.addToSpeed(Statement.If("true", Statement.Op.LIMIT, "25"));
        }
        
        // Ensure base vehicle is set if not in JSON (assuming 'bike' as base)
        // In GH 9.0+, one often sets base in the model.
        // We'll check if setBase exists or is needed. 
        // If compilation fails on setBase, we will remove it, but usually a base is required.
        // Assuming setBase exists based on common CustomModel patterns.
        // If not, we might need a different approach.
        // Investigating API: GH 9.0 CustomModel usually has fields for everything.
        // Let's try map-based config if setBase is missing, but simpler to remove setVehicle.
        
        // Remove setVehicle call as it's deprecated/removed.
        Profile bikeProfile = new Profile("bike_custom");
        bikeProfile.setCustomModel(customModel);
        // bikeProfile.setVehicle("bike"); // Removed
        // bikeProfile.setWeighting("custom"); // might be default if custom model is set? 
        // In 9.0 usage, usually just setCustomModel is enough and weighting is 'custom'.
        bikeProfile.setWeighting("custom");
        
        hopper.setProfiles(bikeProfile);
        
        // CH & LM
        hopper.getCHPreparationHandler().setCHProfiles(new CHProfile("bike_custom"));
        hopper.getLMPreparationHandler().setLMProfiles(new LMProfile("bike_custom"));

        // Encoding
        hopper.setEncodedValuesString("road_class,road_environment,max_speed,surface");

        // Import
        hopper.importOrLoad();
        
        return hopper;
    }
}
