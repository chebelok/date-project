package com.example.dateinvitation.controller;

import com.example.dateinvitation.model.DateResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Map;

@Controller
public class DateController {

    private static final String RESPONSE_FILE_NAME = "readme.md";

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/api/save-response")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveResponse(@RequestBody DateResponse response) {
        if (response.getActivity() == null || response.getDate() == null || response.getTime() == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("success", false));
        }

        try {
            // Locate readme.md in user.dir (project root)
            String workingDir = System.getProperty("user.dir");
            File file = new File(workingDir, RESPONSE_FILE_NAME);

            // Construct response log text
            String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("M/d/yyyy, h:mm:ss a"));
            String entryHeader = "# 💌 Date Planning Responses\n\nThis file stores responses to your date invitations.\n\n";
            String logEntry = "## Response on " + nowStr + "\n" +
                    "- **Activity**: " + response.getActivity() + "\n" +
                    "- **Date**: " + response.getDate() + "\n" +
                    "- **Time**: " + response.getTime() + "\n\n" +
                    "---\n\n";

            if (!file.exists()) {
                // Write header and entry
                Files.writeString(Paths.get(file.getAbsolutePath()), entryHeader + logEntry, StandardOpenOption.CREATE);
            } else {
                // Append entry
                Files.writeString(Paths.get(file.getAbsolutePath()), logEntry, StandardOpenOption.APPEND);
            }

            System.out.println("[Java Server] Saved response: Activity: \"" + response.getActivity() + "\", Date: " + response.getDate() + ", Time: " + response.getTime());
            return ResponseEntity.ok(Map.of("success", true));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
