package com.load.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor

public class FileInfo {
    private String customName;
    private long size;
}
