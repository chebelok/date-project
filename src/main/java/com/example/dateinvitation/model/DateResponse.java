package com.example.dateinvitation.model;

public class DateResponse {
    private String activity;
    private String date;
    private String time;

    // Default constructor
    public DateResponse() {
    }

    // Parametrized constructor
    public DateResponse(String activity, String date, String time) {
        this.activity = activity;
        this.date = date;
        this.time = time;
    }

    // Getters and Setters
    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
