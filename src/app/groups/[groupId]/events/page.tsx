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
import { toast } from "sonner";

const DragAndDropCalendar = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment);

type Event = {
  id: any;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

const Events = () => {
  const calendarRef = useRef<Calendar<object, object> | undefined>(undefined);
  const groupId = useParams()?.groupId;
  const { currentUser } = useGetProfileData();
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [creating, setCreating] = useState(false);
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
    if (creating) return;
    e.preventDefault();
    try {
      setCreating(true);
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
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        toast.success("Event created successfully!");
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
        toast.error(data.errors || "Failed to create event.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setCreating(false);
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
          const fetchedEvents = data.events.map(
            (event: { _id: string; title: string; date: string }) => ({
              id: event._id,
              title: event.title,
              start: new Date(event.date),
              end: new Date(event.date),
              allDay: false,
            })
          );
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
        <DialogContent className=" bg-white ">
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
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
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
                disabled={creating}
                className="bg-blue-500 mt-10 text-white w-full"
              >
                {creating ? "loading..." : " Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calendar */}
      <div className="mt-4 w-full">
        <DragAndDropCalendar
          events={events}
          localizer={localizer}
          step={30}
          drilldownView="week"
          style={{ flex: 1, height: "80vh", width: "100%" }}
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
