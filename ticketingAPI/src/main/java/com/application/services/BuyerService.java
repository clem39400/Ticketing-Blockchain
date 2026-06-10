package com.application.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.application.api.dto.EventInfo;
import com.application.uscases.Buyer.LookupEventInfoUsecase;

@Service
public class BuyerService {

    private final LookupEventInfoUsecase lookupEventInfoUsecase;

    public BuyerService(LookupEventInfoUsecase lookupEventInfoUsecase) {
        this.lookupEventInfoUsecase = lookupEventInfoUsecase;
    }

    public List<EventInfo> lookupEventInfo(String eventName) {
        return lookupEventInfoUsecase.lookupEventInfo(eventName);
    }
}
