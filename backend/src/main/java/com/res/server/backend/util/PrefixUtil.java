package com.res.server.backend.util;

import java.util.Arrays;
import java.util.stream.Collectors;

public final class PrefixUtil {

    private PrefixUtil() {}

    public static String generate(String libraryName) {
        return Arrays.stream(libraryName.trim().split("\\s+"))
                .map(word -> word.substring(0, 1).toUpperCase())
                .collect(Collectors.joining());
    }
}