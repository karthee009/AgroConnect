
package com.example.agroconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MarketPriceService {

    private static final String RESOURCE_URL =
            "https://api.dharun.dev/v1/mandi";

    private final RestClient restClient;

    public MarketPriceService() {
        this.restClient = RestClient.create();
    }

    public Map<String, Object> getMarketPrices(
            String crop,
            String state,
            String district,
            String market,
            Integer limit
    ) {
        int pageLimit = (limit == null || limit < 1)
                ? 100
                : Math.min(limit, 100);

        UriComponentsBuilder uriBuilder =
                UriComponentsBuilder.fromUriString(RESOURCE_URL)
                        .queryParam("limit", pageLimit);

        if (crop != null && !crop.isBlank()) {
            uriBuilder.queryParam("commodity", crop.trim());
        }

        if (state != null && !state.isBlank()) {
            uriBuilder.queryParam("state", state.trim());
        }

        if (district != null && !district.isBlank()) {
            uriBuilder.queryParam("district", district.trim());
        }

        if (market != null && !market.isBlank()) {
            uriBuilder.queryParam("market", market.trim());
        }

        String url = uriBuilder.build()
                .encode()
                .toUriString();

        try {
            JsonNode response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(JsonNode.class);

            List<Map<String, Object>> records =
                    new ArrayList<>();

            if (response != null) {
                JsonNode dataNode = response.path("data");

                if (dataNode.isArray()) {
                    for (JsonNode record : dataNode) {
                        Map<String, Object> item =
                                new LinkedHashMap<>();

                        item.put("state",
                                record.path("state").asString(""));
                        item.put("district",
                                record.path("district").asString(""));
                        item.put("market",
                                record.path("market").asString(""));
                        item.put("commodity",
                                record.path("commodity").asString(""));
                        item.put("variety",
                                record.path("variety").asString(""));
                        item.put("grade",
                                record.path("grade").asString(""));
                        item.put("arrivalDate",
                                record.path("arrival_date").asString(""));
                        item.put("minPrice",
                                record.path("min_price").asString(""));
                        item.put("maxPrice",
                                record.path("max_price").asString(""));
                        item.put("modalPrice",
                                record.path("modal_price").asString(""));

                        records.add(item);
                    }
                }
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("count", records.size());
            result.put("records", records);

            return result;

        } catch (RestClientException exception) {
            throw new IllegalStateException(
                    "Unable to fetch market prices from the alternative mandi API. "
                            + "Check the API status and network connection.",
                    exception
            );
        }
    }
}
