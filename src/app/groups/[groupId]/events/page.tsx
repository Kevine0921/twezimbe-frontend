"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { useGetProfileData } from "@/api/auth";

const DragAndDropCalendar = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment);

const Events = () => {
  const calendarRef = useRef<Calendar<object, object> | undefined>(undefined);
  const groupId = useParams()?.groupId;
  const { currentUser } = useGetProfileData();
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "Custom",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-event/${groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("access-token")}`,
          },
          body: JSON.stringify({
            ...formData,
            userId: currentUser?._id,
            groupId,
          }),
        }
      );

      const data = await response.json();

      if (data.status) {
        // Update events state with new event
        const newEvent = {
          id: data.event._id,
          title: formData.title,
          start: new Date(formData.date),
          end: new Date(formData.date),
          allDay: false,
        };
        setEvents([...events, newEvent]);

        // Reset form after submission
        setFormData({
          title: "",
          date: "",
          type: "Custom",
          description: "",
        });
        setIsOpen(false);
      } else {
        console.error("Error creating event:", data.errors);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-event/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("access-token")}`,
            },
          }
        );

        const data = await res.json();
        if (data.status) {
          const fetchedEvents = data.events.map((event) => ({
            id: event._id,
            title: event.title,
            start: new Date(event.date),
            end: new Date(event.date),
            allDay: false,
          }));
          setEvents(fetchedEvents);
        }
      } catch (error) {
        console.log("could not get events", error);
      }
    };
    if (groupId) {
      getAllEvents();
    }
  }, [groupId]);

  return (
    <div className="w-full mt-10 px-4">
      {/* Dialog for Adding Event */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="bg-blue-500 text-white px-4 py-2"
          >
            Add Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new event.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="title"
                placeholder="Event Title"
                value={formData.title}
                onChange={handleChange}
              />
              <Input
                id="date"
                type="date"
                placeholder="Event Date"
                value={formData.date}
                onChange={handleChange}
              />
              {/* Dropdown for Event Type */}
              <Select id="type" value={formData.type} onChange={handleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Anniversary">Anniversary</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Textarea
                id="description"
                placeholder="Event Description"
                className="w-full border rounded-md p-2"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
              <Button
                type="submit"
                className="bg-blue-500 mt-10 text-white w-full"
              >
                Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calendar */}
      <div className="mt-4">
        <DragAndDropCalendar
          ref={calendarRef}
          events={events}
          localizer={localizer}
          step={30}
          drilldownView="week"
          style={{ height: "68vh" }}
          selectable
          resizable
          longPressThreshold={1}
          popup
        />
      </div>
    </div>
  );
};

export default Events;
