package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.collection.Report;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.repository.ReportRepository;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportController {

    @Autowired
    ReportRepository reportRepository;

    @Autowired
    UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_REPORT') or hasRole('ADMIN')")
    ApiResponse<List<Report>> getReports(@RequestParam(required = false) String status,
                                         @RequestParam(required = false) String type){
        List<Report> result;
        if (status != null) {
            result = reportRepository.findByStatus(status);
        } else if (type != null) {
            result = reportRepository.findByType(type);
        } else {
            result = reportRepository.findAll();
        }
        return ApiResponse.<List<Report>>builder().result(result).build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('READ_REPORT') or hasRole('ADMIN')")
    ApiResponse<java.util.Map<String, Object>> getStats(){
        var all = reportRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(r -> "pending".equals(r.getStatus())).count();
        long resolved = all.stream().filter(r -> "resolved".equals(r.getStatus())).count();
        long resolutionRate = total > 0 ? Math.round((resolved * 100.0) / total) : 0;
        var map = new java.util.HashMap<String, Object>();
        map.put("total", total);
        map.put("pending", pending);
        map.put("resolved", resolved);
        map.put("resolutionRate", resolutionRate);
        return ApiResponse.<java.util.Map<String, Object>>builder().result(map).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_REPORT') or hasRole('ADMIN')")
    ApiResponse<Report> getReport(@PathVariable String id){
        return ApiResponse.<Report>builder().result(reportRepository.findById(id).orElse(null)).build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_REPORT')")
    ApiResponse<Report> createReport(@RequestBody Report request){
        var currentUser = userService.getMyInfo();
        request.setAuthorId(currentUser.getId());
        if (request.getStatus() == null) request.setStatus("pending");
        reportRepository.save(request);
        return ApiResponse.<Report>builder().result(request).build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('UPDATE_REPORT') or hasRole('ADMIN')")
    ApiResponse<Report> updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body){
        var report = reportRepository.findById(id).orElse(null);
        if (report != null) {
            report.setStatus(body.getOrDefault("status", report.getStatus()));
            reportRepository.save(report);
        }
        return ApiResponse.<Report>builder().result(report).build();
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('UPDATE_REPORT') or hasRole('ADMIN')")
    ApiResponse<Report> reject(@PathVariable String id, @RequestBody(required = false) java.util.Map<String, String> body){
        var report = reportRepository.findById(id).orElse(null);
        if (report != null) {
            report.setStatus("rejected");
            reportRepository.save(report);
        }
        return ApiResponse.<Report>builder().result(report).build();
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasAuthority('UPDATE_REPORT') or hasRole('ADMIN')")
    ApiResponse<Report> accept(@PathVariable String id){
        var report = reportRepository.findById(id).orElse(null);
        if (report != null) {
            report.setStatus("investigating");
            reportRepository.save(report);
        }
        return ApiResponse.<Report>builder().result(report).build();
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAuthority('UPDATE_REPORT') or hasRole('ADMIN')")
    ApiResponse<Report> resolve(@PathVariable String id){
        var report = reportRepository.findById(id).orElse(null);
        if (report != null) {
            report.setStatus("resolved");
            reportRepository.save(report);
        }
        return ApiResponse.<Report>builder().result(report).build();
    }
}