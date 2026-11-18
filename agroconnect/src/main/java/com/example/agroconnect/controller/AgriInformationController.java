
package com.example.agroconnect.controller;
import com.example.agroconnect.service.MarketPriceService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agri-info")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AgriInformationController {

    private final MarketPriceService marketPriceService;

    public AgriInformationController(
            MarketPriceService marketPriceService
    ) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping("/market-prices")
    public Map<String, Object> marketPrices(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) Integer limit
    ) {
        return marketPriceService.getMarketPrices(
                crop,
                state,
                district,
                market,
                limit
        );
    }

    @GetMapping("/schemes")
    public Map<String, Object> schemes() {
        List<Map<String, Object>> rows = new ArrayList<>();

        rows.add(scheme(
                "PM-KISAN",
                "Income support for eligible landholding farmer families.",
                "https://pmkisan.gov.in/"
        ));

        rows.add(scheme(
                "Kisan Credit Card (KCC)",
                "Credit facility for eligible agricultural and allied activities.",
                "https://www.myscheme.gov.in/"
        ));

        rows.add(scheme(
                "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "Crop insurance subject to notified crops, areas and enrolment windows.",
                "https://pmfby.gov.in/"
        ));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("schemes", rows);
        response.put(
                "notice",
                "Starter directory only. Check official portals for current rules, deadlines, notified crops and state-specific details."
        );

        return response;
    }

    private Map<String, Object> scheme(
            String name,
            String description,
            String url
    ) {
        Map<String, Object> scheme = new LinkedHashMap<>();
        scheme.put("name", name);
        scheme.put("description", description);
        scheme.put("officialUrl", url);

        return scheme;
    }
}
