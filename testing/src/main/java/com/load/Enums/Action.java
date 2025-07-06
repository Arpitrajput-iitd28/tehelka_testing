package com.load.Enums;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor

public enum Action {
    CONTINUE("Continue"),
    START("Start Next Thread Loop"),
    STOPTHREAD("Stop Thread"),
    STOPTEST("Stop Test"),
    STOPTESTNOW("Stop Test Now");

    private final String label;
    

}
