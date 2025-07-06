package com.load.Enums;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter 
@AllArgsConstructor
public enum Thread {
    THREAD("Thread Properties"),
    ULTIMATETHR("Ultimate Thread Properties");

    private final String label;
    
}
