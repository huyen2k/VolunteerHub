package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventRegistrationResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventRegistrationMapper;
import com.volunteerhub.VolunteerHub.repository.EventRegistrationRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventRegistrationService {
    @Autowired
    EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    EventRegistrationMapper eventRegistrationMapper;

    @Autowired
    NotificationService notificationService;

    @Autowired
    EventRepository eventRepository;

    @Autowired
    UserService userService;

    public EventRegistrationResponse createRegistration(EventRegistrationCreationRequest request){
        //Check trùng
        if(eventRegistrationRepository.existsByEventIdAndUserId(request.getEventId(), request.getUserId())){
            throw new AppException(ErrorCode.REGISTRATION_EXISTED);
        }

        //Lấy event (chỉ 1 lần)
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_EXISTED));

        // Đếm số lượng
        long currentCount = eventRegistrationRepository.findByEventId(request.getEventId()).stream()
                .filter(r -> !"rejected".equals(r.getStatus()))
                .count();

        //Kiểm tra đầy
        if (event.getVolunteersNeeded() > 0 && currentCount >= event.getVolunteersNeeded()) {
            throw new AppException(ErrorCode.EVENT_FULL);
        }

        //Lưu
        EventRegistration eventRegistration = eventRegistrationMapper.toEventRegistration(request);
        eventRegistration.setStatus("pending");
        eventRegistrationRepository.save(eventRegistration);

        //Gửi thông báo
        try {
            if (event.getCreatedBy() != null) {
                notificationService.createNotificationForUser(
                        event.getCreatedBy(),
                        "event_registration",
                        "Có đăng ký mới cho sự kiện của bạn"
                );
            }
        } catch (Exception ignored) {}

        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }

    public EventRegistrationResponse updateRegistration(String registrationId, EventRegistrationUpdateRequest request){
        EventRegistration eventRegistration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_EXISTED));

        Event event = eventRepository.findById(eventRegistration.getEventId())
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_EXISTED));

        // Lấy user hiện tại đang gọi API
        var currentUser = userService.getMyInfo();

        // Nếu user này KHÔNG PHẢI là người tạo sự kiện (Manager) thì báo lỗi
        if (!event.getCreatedBy().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String oldStatus = eventRegistration.getStatus();
        eventRegistrationMapper.updateEventRegistration(eventRegistration, request);
        eventRegistrationRepository.save(eventRegistration);

        // Gửi thông báo
        if (!oldStatus.equals(request.getStatus()) &&
                ("approved".equals(request.getStatus()) || "rejected".equals(request.getStatus()))) {

            String eventTitle = event.getTitle() != null ? event.getTitle() : "sự kiện";
            String message = "approved".equals(request.getStatus())
                    ? String.format("Đăng ký của bạn cho sự kiện '%s' đã được duyệt", eventTitle)
                    : String.format("Đăng ký của bạn cho sự kiện '%s' đã bị từ chối", eventTitle);

            notificationService.createNotificationForUser(
                    eventRegistration.getUserId(),
                    "registration_status",
                    message
            );
        }

        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }

    public EventRegistrationResponse getRegistration(String registrationId){
        EventRegistration eventRegistration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_EXISTED));
        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }


    public void deleteRegistration(String registrationId){
        //Tìm bản ghi đăng ký
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_EXISTED));

        // Lấy thông tin người đang thực hiện xóa
        var currentUser = userService.getMyInfo();
        String currentUserId = currentUser.getId();

        //  Kiểm tra quyền xóa:
        // - Là chính chủ (người đăng ký)
        // - HOẶC là Admin (có role ADMIN)
        // - (Có thể thêm: HOẶC là Manager của sự kiện đó)
        boolean isOwner = registration.getUserId().equals(currentUserId);
        boolean isAdmin = currentUser.getRoles().contains("ADMIN");

        // Nếu muốn Manager được xóa người tham gia khỏi sự kiện của họ:
        boolean isEventManager = false;
        try {
            Event event = eventRepository.findById(registration.getEventId()).orElse(null);
            if (event != null && event.getCreatedBy().equals(currentUserId)) {
                isEventManager = true;
            }
        } catch (Exception ignored) {}

        if (!isOwner && !isAdmin && !isEventManager) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        eventRegistrationRepository.deleteById(registrationId);
    }

    public List<EventRegistrationResponse> getRegistrationsByEvent(String eventId) {
        return eventRegistrationRepository.findByEventId(eventId).stream()
                .map(eventRegistrationMapper::toEventRegistrationResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<EventRegistrationResponse> getRegistrationsByUser(String userId) {
        return eventRegistrationRepository.findByUserId(userId).stream()
                .map(eventRegistrationMapper::toEventRegistrationResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}