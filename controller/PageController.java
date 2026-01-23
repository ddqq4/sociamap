package ru.socialmap.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class PageController {
    @GetMapping("/")
    public String home() {
        return "redirect:/index.html";
    }
    @GetMapping("/map")
    public String map() {
        return "index";
    }
}
