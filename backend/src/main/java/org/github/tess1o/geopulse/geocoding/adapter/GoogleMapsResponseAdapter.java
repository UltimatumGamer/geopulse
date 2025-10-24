package org.github.tess1o.geopulse.geocoding.adapter;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.extern.slf4j.Slf4j;
import org.github.tess1o.geopulse.geocoding.exception.GeocodingException;
import org.github.tess1o.geopulse.geocoding.model.common.FormattableGeocodingResult;
import org.github.tess1o.geopulse.geocoding.model.common.SimpleFormattableResult;
import org.github.tess1o.geopulse.geocoding.model.googlemaps.*;
import org.github.tess1o.geopulse.shared.geo.GeoUtils;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;

import java.util.List;

/**
 * Simplified adapter for converting Google Maps geocoding responses.
 * Formats display names specifically for Google Maps results.
 */
@ApplicationScoped
@Slf4j
public class GoogleMapsResponseAdapter implements GeocodingResponseAdapter<GoogleMapsResponse> {

    private static final String PROVIDER_NAME = "GoogleMaps";

    @Override
    public FormattableGeocodingResult adapt(GoogleMapsResponse googleResponse, Point requestCoordinates, String providerName) {

        if (googleResponse == null || googleResponse.getResults() == null || googleResponse.getResults().isEmpty()) {
            log.warn("Empty or null Google Maps response for coordinates: lon={}, lat={}",
                    requestCoordinates.getX(), requestCoordinates.getY());
            throw new GeocodingException("Google Maps returned empty or null response");
        }

        // Use the first result (most relevant)
        GoogleMapsResult firstResult = googleResponse.getResults().getFirst();

        SimpleFormattableResult.SimpleFormattableResultBuilder builder = SimpleFormattableResult.builder()
                .requestCoordinates(requestCoordinates)
                .providerName(providerName);

        // Extract result coordinates
        if (firstResult.getGeometry() != null && firstResult.getGeometry().getLocation() != null) {
            GoogleMapsLocation location = firstResult.getGeometry().getLocation();
            Point resultCoordinates = GeoUtils.createPoint(location.getLng(), location.getLat());
            builder.resultCoordinates(resultCoordinates);
        } else {
            builder.resultCoordinates(requestCoordinates);
        }

        // Extract bounding box from viewport or bounds
        if (firstResult.getGeometry() != null) {
            Polygon boundingBox = extractBoundingBox(firstResult.getGeometry());
            builder.boundingBox(boundingBox);
        }

        // Format display name using Google Maps specific logic
        String formattedDisplayName = formatGoogleMapsDisplayName(firstResult);
        builder.formattedDisplayName(formattedDisplayName);

        // Extract city and country from address components
        if (firstResult.getAddressComponents() != null) {
            builder.city(extractCity(firstResult.getAddressComponents()));
            builder.country(extractCountry(firstResult.getAddressComponents()));
        }

        return builder.build();
    }

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    /**
     * Format display name for Google Maps results.
     * Follows the pattern: "Name (Street Address)" or just "Formatted Address" if no name.
     */
    private String formatGoogleMapsDisplayName(GoogleMapsResult result) {
        String establishmentName = extractEstablishmentName(result.getAddressComponents());
        String streetAddress = extractStreetAddress(result.getAddressComponents());

        if (establishmentName != null && !establishmentName.isBlank()) {
            if (streetAddress != null && !streetAddress.isBlank()) {
                return String.format("%s (%s)", establishmentName, streetAddress);
            } else {
                return establishmentName;
            }
        } else {
            // Fallback to formatted address
            return result.getFormattedAddress() != null ?
                    result.getFormattedAddress() :
                    "Unknown location";
        }
    }

    /**
     * Extract establishment/POI name from address components.
     */
    private String extractEstablishmentName(List<GoogleMapsAddressComponent> components) {
        if (components == null) {
            return null;
        }

        return components.stream()
                .filter(c -> c.getTypes() != null &&
                        (c.getTypes().contains("establishment") ||
                                c.getTypes().contains("point_of_interest") ||
                                c.getTypes().contains("premise")))
                .map(GoogleMapsAddressComponent::getLongName)
                .findFirst()
                .orElse(null);
    }

    /**
     * Extract street address (number + route) from address components.
     */
    private String extractStreetAddress(List<GoogleMapsAddressComponent> components) {
        if (components == null) {
            return null;
        }

        String streetNumber = null;
        String route = null;

        for (GoogleMapsAddressComponent component : components) {
            if (component.getTypes() == null) {
                continue;
            }

            if (component.getTypes().contains("street_number")) {
                streetNumber = component.getLongName();
            } else if (component.getTypes().contains("route")) {
                route = component.getLongName();
            }
        }

        if (route != null) {
            if (streetNumber != null) {
                return String.format("%s %s", streetNumber, route);
            } else {
                return route;
            }
        }

        return null;
    }

    /**
     * Extract city name from address components.
     */
    private String extractCity(List<GoogleMapsAddressComponent> components) {
        if (components == null) {
            return null;
        }

        return components.stream()
                .filter(c -> c.getTypes() != null &&
                        (c.getTypes().contains("locality") ||
                         c.getTypes().contains("administrative_area_level_2") ||
                         c.getTypes().contains("sublocality")))
                .map(GoogleMapsAddressComponent::getLongName)
                .findFirst()
                .orElse(null);
    }

    /**
     * Extract country name from address components.
     */
    private String extractCountry(List<GoogleMapsAddressComponent> components) {
        if (components == null) {
            return null;
        }

        return components.stream()
                .filter(c -> c.getTypes() != null && c.getTypes().contains("country"))
                .map(GoogleMapsAddressComponent::getLongName)
                .findFirst()
                .orElse(null);
    }

    /**
     * Extract bounding box from Google Maps geometry.
     */
    private Polygon extractBoundingBox(GoogleMapsGeometry geometry) {
        GoogleMapsViewport viewport = geometry.getBounds() != null ?
                geometry.getBounds() : geometry.getViewport();

        if (viewport == null || viewport.getNortheast() == null || viewport.getSouthwest() == null) {
            return null;
        }

        try {
            GoogleMapsLocation ne = viewport.getNortheast();
            GoogleMapsLocation sw = viewport.getSouthwest();

            return GeoUtils.buildBoundingBoxPolygon(
                    sw.getLat(), ne.getLat(), sw.getLng(), ne.getLng()
            );
        } catch (Exception e) {
            log.warn("Failed to create bounding box from Google Maps viewport", e);
            return null;
        }
    }

}