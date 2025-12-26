package com.res.server.backend.service.context;

import java.util.UUID;

public class LibraryContext {

    private static final ThreadLocal<UUID> CURRENT_LIBRARY = new ThreadLocal<>();

    public static void setLibraryId(UUID libraryId) {
        CURRENT_LIBRARY.set(libraryId);
    }

    public static UUID getLibraryId() {
        return CURRENT_LIBRARY.get();
    }

    public static void clear() {
        CURRENT_LIBRARY.remove();
    }
}