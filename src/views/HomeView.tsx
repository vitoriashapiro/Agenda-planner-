
/**
 * Página Inicial (Dashboard) do Meu Planner
 */
import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  BookOpen,
  Sparkles,
  Plus,
  ChevronRight,
  CheckCircle2,
  Circle,
  Heart,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  Wind,
  Droplets,
  ThermometerSun,
  RefreshCw,
  MapPin,
} from 'lucide-react';

import { usePlanner } from '../context/PlannerContext';
import { CarinhoDoDia } from '../components/CarinhoDoDia';
import { getTodayString } from '../services/storageService';

type WeatherData = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  code: number;
  isDay: number;
  forecast: {
    date: string;
    max: number;
    min: number;
    code: number;
    rain: number;
  }[];
};

const weatherDescription = (code: number) => {
  if (code === 0) return 'Céu limpo';
  if (code <= 2) return 'Poucas nuvens';
  if (code === 3) return 'Nublado';
  if (code <= 48) return 'Neblina';
  if (code <= 57) return 'Garoa';
  if (code <= 67) return 'Chuva';
  if (code <= 77) return 'Neve';
  if (code <= 82) return 'Pancadas de chuva';
  if (code <= 86) return 'Neve intensa';
  if (code >= 95) return 'Trovoadas';
  return 'Condição variável';
};

const WeatherIcon = ({ code, size = 28 }: { code: number; size?: number }) => {
  const props = { size, strokeWidth: 1.7 };

  if (code === 0) return <Sun {...props} />;
  if (code <= 2) return <CloudSun {...props} />;
  if (code <= 3) return <Cloud {...props} />;
  if (code <= 48) return <CloudFog {...props} />;
  if (code <= 57) return <CloudDrizzle {...props} />;
  if (code <= 67 || (code >= 80 && code <= 82)) {
    return <CloudRain {...props} />;
  }
  if (code <= 77 || code <= 86) return <CloudSnow {...props} />;
  return <CloudRain {...props} />;
};

const getWeekday = (date: string) => {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
  }).replace('.', '');
};

export const HomeView: React.FC = () => {
  const {
    events,
    tasks,
    notes,
    reminders,
    categories,
    setCurrentTab,
    setSelectedDate,
    toggleTaskCompleted,
    toggleEventCompleted,
    openQuickAdd,
  } = usePlanner();

  const today = getTodayString();

  // PREVISÃO DO TEMPO
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState('');

  useEffect(() => {
    let active = true;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=5'
        );

        if (!response.ok) {
          throw new Error('Não foi possível consultar o clima.');
        }

        const data = await response.json();

        if (!active) return;

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code,
          isDay: data.current.is_day,
          forecast: data.daily.time.map((date: string, index: number) => ({
            date,
            max: Math.round(data.daily.temperature_2m_max[index]),
            min: Math.round(data.daily.temperature_2m_min[index]),
            code: data.daily.weather_code[index],
            rain: data.daily.precipitation_probability_max[index] ?? 0,
          })),
        });

        setLastWeatherUpdate(
          new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );

        setWeatherError(false);
      } catch (error) {
        if (active) setWeatherError(true);
      } finally {
        if (active) setWeatherLoading(false);
      }
    };

    fetchWeather();

    const interval = window.setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  // COMPROMISSOS
  const todayEvents = events.filter((e) => e.date === today);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayTasks = pendingTasks.filter((t) => t.dueDate === today);
  const displayTasks = todayTasks.length > 0
    ? todayTasks
    : pendingTasks.slice(0, 4);

  // LEMBRETES
  const upcomingReminders = reminders
    .filter((r) => r.status === 'pending' || r.status === 'sent')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 4);

  // ANOTAÇÕES
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  // CALENDÁRIO
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const handleDayClick = (dayNumber: number) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setCurrentTab('calendar');
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 animate-in fade-in duration-500">

      {/* BANNER DE BOAS-VINDAS */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-white via-[#FFF5F8] to-[#FBEAF1] border border-[#F2DFE7] shadow-planner transition-all duration-500 hover:shadow-planner-hover">

        <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-[#F4DCE5]/40 blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-24 h-24 rounded-full bg-white/50 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B77E94] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seu cantinho de organização</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#786572] leading-snug">
            Olá! Vamos organizar seu dia? <span className="text-[#D49AB1]">♡</span>
          </h2>

          <p className="text-sm text-[#9C8993] mt-2 max-w-xl leading-relaxed">
            Cultive seus hábitos, visualize seus compromissos e cuide do que realmente importa para você hoje.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => openQuickAdd('event')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#FFF9FB] text-[#886E7B] border border-[#EEDCE5] text-xs font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#C18AA2]" />
            <span>Agendar Evento</span>
          </button>

          <button
            onClick={() => openQuickAdd('task')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* CARINHO DO DIA */}
      <div className="transition-all duration-300 hover:-translate-y-0.5">
        <CarinhoDoDia />
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

        {/* COLUNAS DE COMPROMISSOS E TAREFAS */}
        <div className="lg:col-span-2 space-y-5 lg:space-y-6">

          {/* COMPROMISSOS DE HOJE */}
          <div className="bg-white rounded-[26px] border border-[#F2E1E8] p-5 sm:p-6 shadow-planner transition-all duration-300 hover:shadow-planner-hover">
            <div className="flex items-center justify-between pb-4 border-b border-[#F8EDF2]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FCEEF4] text-[#C18AA2]">
                  <CalendarIcon className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#786572]">
                    Compromissos de Hoje
                  </h3>
                  <p className="text-xs text-[#AA96A1] mt-0.5">
                    {todayEvents.length === 0
                      ? 'Nenhum compromisso marcado para hoje'
                      : `${todayEvents.length} compromisso(s) na sua agenda`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('calendar')}
                className="text-xs font-semibold text-[#B47B92] hover:text-[#934E65] flex items-center gap-1 transition-all hover:gap-2"
              >
                Ver agenda <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-4 space-y-3">
              {todayEvents.length === 0 ? (
                <div className="py-8 text-center bg-[#FFFAFC] rounded-2xl border border-dashed border-[#EEDCE5]">
                  <p className="text-sm text-[#9C8993]">
                    Sua agenda está livre hoje. Que tal um momento para você? ☕
                  </p>

                  <button
                    onClick={() => openQuickAdd('event')}
                    className="mt-3 px-4 py-2 rounded-full bg-white border border-[#EEDCE5] text-xs font-medium text-[#B47B92] hover:bg-[#FCEEF4] transition-all hover:scale-105"
                  >
                    + Adicionar compromisso hoje
                  </button>
                </div>
              ) : (
                todayEvents.map((evt) => {
                  const cat = categories.find((c) => c.id === evt.categoryId);

                  return (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-2xl bg-[#FFFAFC] hover:bg-[#FFF5F8] border border-[#F3E3E9] flex items-center justify-between gap-3 transition-all duration-300 hover:translate-x-0.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleEventCompleted(evt.id)}
                          className="text-[#D9A2B5] hover:text-[#B26E86] transition-transform hover:scale-110 shrink-0"
                          title="Marcar como concluído"
                        >
                          {evt.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <p className={`text-sm font-semibold text-[#786572] truncate ${evt.completed ? 'line-through opacity-60' : ''}`}>
                            {evt.title}
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-xs text-[#AA96A1]">
                            <span>{evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                            {evt.location && <span>• {evt.location}</span>}
                          </div>
                        </div>
                      </div>

                      {cat && (
                        <span
                          style={{ backgroundColor: cat.bgColor, color: cat.color }}
                          className="text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 border border-black/5"
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* TAREFAS PENDENTES */}
          <div className="bg-white rounded-[26px] border border-[#F2E1E8] p-5 sm:p-6 shadow-planner transition-all duration-300 hover:shadow-planner-hover">
            <div className="flex items-center justify-between pb-4 border-b border-[#F8EDF2]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#F1ECF8] text-[#A18BC5]">
                  <CheckSquare className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#786572]">
                    Minhas Tarefas
                  </h3>
                  <p className="text-xs text-[#AA96A1] mt-0.5">
                    {pendingTasks.length} tarefa(s) pendente(s)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('tasks')}
                className="text-xs font-semibold text-[#B47B92] hover:text-[#934E65] flex items-center gap-1 transition-colors"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-4 space-y-2.5">
              {displayTasks.length === 0 ? (
                <div className="py-6 text-center text-sm text-[#9C8993]">
                  Todas as tarefas em dia! Que sensação maravilhosa! ✨
                </div>
              ) : (
                displayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-white hover:bg-[#FFFAFC] border border-[#F3E3E9] flex items-center justify-between gap-3 transition-all duration-300 hover:translate-x-0.5 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="text-[#D9A2B5] hover:text-[#B26E86] transition-transform group-hover:scale-110 shrink-0"
                      >
                        <Circle className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <span className="text-sm font-medium text-[#786572] block truncate">
                          {task.name}
                        </span>

                        {task.dueDate && (
                          <span className="text-[11px] text-[#AA96A1]">
                            Prazo: {task.dueDate === today ? 'Hoje' : task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* COLUNA LATERAL */}
        <div className="space-y-5 lg:space-y-6">

          {/* PREVISÃO DO TEMPO */}
          <div className="relative overflow-hidden rounded-[26px] border border-[#F0DDE6] bg-gradient-to-br from-[#FFF9F3] via-[#FCEEF4] to-[#F7F0FA] p-5 shadow-planner transition-all duration-300 hover:shadow-planner-hover">

            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/40 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 bottom-0 w-28 h-28 rounded-full bg-[#E8C7D9]/25 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[#A36F87]">
                    <MapPin size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      São Paulo, SP
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#786572] mt-1">
                    Clima de hoje
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setWeatherLoading(true);
                    setWeatherError(false);
                    fetch(
                      'https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=5'
                    )
                      .then((r) => {
                        if (!r.ok) throw new Error('Erro ao atualizar');
                        return r.json();
                      })
                      .then((data) => {
                        setWeather({
                          temperature: Math.round(data.current.temperature_2m),
                          feelsLike: Math.round(data.current.apparent_temperature),
                          humidity: data.current.relative_humidity_2m,
                          wind: Math.round(data.current.wind_speed_10m),
                          code: data.current.weather_code,
                          isDay: data.current.is_day,
                          forecast: data.daily.time.map((date: string, index: number) => ({
                            date,
                            max: Math.round(data.daily.temperature_2m_max[index]),
                            min: Math.round(data.daily.temperature_2m_min[index]),
                            code: data.daily.weather_code[index],
                            rain: data.daily.precipitation_probability_max[index] ?? 0,
                          })),
                        });
                        setLastWeatherUpdate(
                          new Date().toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        );
                      })
                      .catch(() => setWeatherError(true))
                      .finally(() => setWeatherLoading(false));
                  }}
                  className="p-2 rounded-full bg-white/70 text-[#A36F87] hover:bg-white transition-all hover:rotate-180"
                  title="Atualizar previsão"
                >
                  <RefreshCw size={14} className={weatherLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {weatherLoading && !weather ? (
                <div className="py-8 text-center">
                  <CloudSun size={35} className="mx-auto text-[#D9A2B5] animate-pulse" />
                  <p className="text-xs text-[#9B8C94] mt-3">
                    Buscando o clima...
                  </p>
                </div>
              ) : weatherError && !weather ? (
                <div className="py-6 text-center">
                  <Cloud size={30} className="mx-auto text-[#C6A6B6]" />
                  <p className="text-xs text-[#8C7A83] mt-2">
                    Não conseguimos carregar a previsão.
                  </p>
                  <p className="text-[10px] text-[#A697A0] mt-1">
                    Verifique sua conexão e tente atualizar.
                  </p>
                </div>
              ) : weather ? (
                <>
                  <div className="flex items-center gap-4 py-2">
                    <div className="text-[#D9A05F] drop-shadow-sm">
                      <WeatherIcon code={weather.code} size={57} />
                    </div>

                    <div>
                      <div className="flex items-start">
                        <span className="text-5xl font-bold tracking-tight text-[#786572]">
                          {weather.temperature}°
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#956D80]">
                        {weatherDescription(weather.code)}
                      </p>
                      <p className="text-[11px] text-[#AA96A1]">
                        Sensação de {weather.feelsLike}°
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="rounded-2xl bg-white/65 p-2.5 text-center">
                      <ThermometerSun size={16} className="mx-auto text-[#D99B73] mb-1" />
                      <p className="text-[9px] text-[#AA96A1]">Sensação</p>
                      <p className="text-xs font-bold text-[#786572]">
                        {weather.feelsLike}°
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/65 p-2.5 text-center">
                      <Droplets size={16} className="mx-auto text-[#8FAFC9] mb-1" />
                      <p className="text-[9px] text-[#AA96A1]">Umidade</p>
                      <p className="text-xs font-bold text-[#786572]">
                        {weather.humidity}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/65 p-2.5 text-center">
                      <Wind size={16} className="mx-auto text-[#9A9DBD] mb-1" />
                      <p className="text-[9px] text-[#AA96A1]">Vento</p>
                      <p className="text-xs font-bold text-[#786572]">
                        {weather.wind} km/h
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-[#8C6B7B] uppercase tracking-wider">
                        Próximos dias
                      </span>
                      <span className="text-[9px] text-[#AA96A1]">
                        Previsão
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {weather.forecast.map((day, index) => (
                        <div
                          key={day.date}
                          className={`rounded-2xl py-2 px-1 text-center transition-all duration-300 hover:bg-white/80 hover:-translate-y-0.5 ${
                            index === 0 ? 'bg-white/70' : 'bg-white/35'
                          }`}
                        >
                          <p className="text-[9px] font-semibold text-[#AA96A1] capitalize">
                            {index === 0 ? 'Hoje' : getWeekday(day.date)}
                          </p>

                          <div className="flex justify-center my-2 text-[#C79672]">
                            <WeatherIcon code={day.code} size={19} />
                          </div>

                          <p className="text-[10px] font-bold text-[#786572]">
                            {day.max}°
                          </p>
                          <p className="text-[9px] text-[#AA96A1]">
                            {day.min}°
                          </p>

                          {day.rain > 0 && (
                            <div className="flex items-center justify-center gap-0.5 mt-1 text-[#83A9C4]">
                              <Droplets size={9} />
                              <span className="text-[8px]">{day.rain}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E8C9D8]/60">
                    <span className="text-[9px] text-[#AA96A1]">
                      Atualizado às {lastWeatherUpdate}
                    </span>
                    <span className="text-[9px] text-[#AA96A1]">
                      Dados: Open-Meteo
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* MINI CALENDÁRIO */}
          <div className="bg-white rounded-[26px] border border-[#F2E1E8] p-5 shadow-planner transition-all duration-300 hover:shadow-planner-hover">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8EDF2]">
              <span className="text-base font-bold text-[#786572]">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <button
                onClick={() => setCurrentTab('calendar')}
                className="text-[11px] font-semibold text-[#B47B92] hover:underline"
              >
                Abrir mês
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-semibold text-[#AA96A1]">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === today;
                const hasEvents = events.some((e) => e.date === dateStr);

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleDayClick(dayNum)}
                    className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all duration-200 hover:scale-110 ${
                      isToday
                        ? 'bg-[#D9A2B5] text-white font-bold shadow-sm scale-110'
                        : 'text-[#786572] hover:bg-[#FCEEF4]'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && !isToday && (
                      <span className="w-1 h-1 rounded-full bg-[#D9A2B5] -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEMBRETES */}
          <div className="bg-white rounded-[26px] border border-[#F2E1E8] p-5 shadow-planner transition-all duration-300 hover:shadow-planner-hover">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8EDF2]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A059]" />
                <span className="text-base font-bold text-[#786572]">
                  Lembretes Próximos
                </span>
              </div>

              <button
                onClick={() => setCurrentTab('reminders')}
                className="text-[11px] font-semibold text-[#B47B92]"
              >
                Ver todos
              </button>
            </div>

            <div className="pt-3 space-y-2.5">
              {upcomingReminders.length === 0 ? (
                <p className="text-sm text-[#AA96A1] py-4 text-center">
                  Sem lembretes para os próximos momentos.
                </p>
              ) : (
                upcomingReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-2xl bg-[#FFFAFC] border border-[#F3E3E9] flex items-center justify-between gap-2 transition-all hover:translate-x-0.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#786572] truncate">
                        {rem.title}
                      </p>
                      <p className="text-[11px] text-[#AA96A1]">
                        {rem.date} às {rem.time}
                      </p>
                    </div>

                    <span className="text-[10px] text-[#C5A059] bg-[#FBF7EE] px-2.5 py-1 rounded-full font-medium shrink-0">
                      Agendado
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CADERNO DIGITAL */}
          <div className="bg-white rounded-[26px] border border-[#F2E1E8] p-5 shadow-planner transition-all duration-300 hover:shadow-planner-hover">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8EDF2]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#E8A598]" />
                <span className="text-base font-bold text-[#786572]">
                  Caderno Digital
                </span>
              </div>

              <button
                onClick={() => setCurrentTab('notes')}
                className="text-[11px] font-semibold text-[#B47B92]"
              >
                Abrir caderno
              </button>
            </div>

            <div className="pt-3 space-y-2.5">
              {recentNotes.length === 0 ? (
                <p className="text-sm text-[#AA96A1] py-4 text-center">
                  Nenhuma anotação guardada ainda.
                </p>
              ) : (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setCurrentTab('notes')}
                    style={{ backgroundColor: note.color || '#FFF9F4' }}
                    className="p-3.5 rounded-2xl border border-[#D9A2B5]/25 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#786572] truncate">
                        {note.title}
                      </h4>
                      {note.isFavorite && (
                        <Heart className="w-3.5 h-3.5 fill-[#D9A2B5] text-[#D9A2B5] shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-[#8F7D87] mt-1.5 line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
