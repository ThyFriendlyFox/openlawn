import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Route } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import type { Schedule, Customer, Crew } from '@/lib/types';

interface ScheduleViewProps {
  crew: Crew;
  schedules: Schedule[];
  customers: Customer[];
  onAddSchedule?: () => void;
  onViewRoute?: (scheduleId: string) => void;
  onEditSchedule?: (schedule: Schedule) => void;
}

const SCHEDULE_STATUS_COLORS = {
  'scheduled': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const getDateLabel = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d');
};

const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export function ScheduleView({ 
  crew, 
  schedules, 
  customers, 
  onAddSchedule, 
  onViewRoute, 
  onEditSchedule 
}: ScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);

  const filteredSchedules = schedules.filter(schedule => {
    if (viewMode === 'week') {
      return schedule.date >= weekStart && schedule.date <= weekEnd;
    } else {
      return format(schedule.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
    }
  });

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getCustomerAddress = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.address || 'Unknown Address';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
  };

  const getDaySchedules = (date: Date): Schedule[] => {
    return schedules.filter(schedule => 
      format(schedule.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const renderDayView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDay('prev')}
          >
            ← Previous
          </Button>
          <h2 className="text-xl font-semibold">
            {getDateLabel(currentDate)}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDay('next')}
          >
            Next →
          </Button>
        </div>
        <Button onClick={onAddSchedule} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {filteredSchedules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No schedules for this day</h3>
            <p className="text-muted-foreground mb-4">
              Create a new schedule to get started
            </p>
            <Button onClick={onAddSchedule}>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {schedule.startTime} - {schedule.endTime}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {schedule.assignedCustomers.length} customers assigned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={SCHEDULE_STATUS_COLORS[schedule.status]}>
                      {schedule.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewRoute?.(schedule.id)}
                    >
                      <Route className="w-4 h-4 mr-2" />
                      View Route
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSchedule?.(schedule)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.assignedCustomers.map((assignedCustomer) => (
                    <div
                      key={assignedCustomer.customerId}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {getCustomerName(assignedCustomer.customerId)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getCustomerAddress(assignedCustomer.customerId)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {assignedCustomer.estimatedStartTime}
                        </Badge>
                        <Badge variant="outline">
                          {assignedCustomer.estimatedDuration}min
                        </Badge>
                        <Badge className={
                          assignedCustomer.priority === 'high' ? 'bg-red-100 text-red-800' :
                          assignedCustomer.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {assignedCustomer.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {schedule.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Notes:</strong> {schedule.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            ← Previous Week
          </Button>
          <h2 className="text-xl font-semibold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            Next Week →
          </Button>
        </div>
        <Button onClick={onAddSchedule} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          const daySchedules = getDaySchedules(date);
          
          return (
            <Card key={i} className="min-h-[200px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {format(date, 'EEE')}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {format(date, 'MMM d')}
                </p>
                {isToday(date) && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Today
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {daySchedules.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No schedules
                  </p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-2 bg-muted/50 rounded text-xs cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => onEditSchedule?.(schedule)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {schedule.startTime}
                          </span>
                          <Badge className={SCHEDULE_STATUS_COLORS[schedule.status]}>
                            {schedule.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {schedule.assignedCustomers.length} customers
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crew Schedule</h1>
          <p className="text-muted-foreground">
            Managing schedule for {crew.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {viewMode === 'day' ? renderDayView() : renderWeekView()}
    </div>
  );
} 