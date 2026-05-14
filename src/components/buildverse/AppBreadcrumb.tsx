import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  "": "Главная",
  login: "Вход",
  register: "Регистрация",
  chat: "AI-агент",
  projects: "Проекты",
  estimate: "Смета",
  pricing: "Тарифы",
  passport: "Цифровой паспорт",
  notifications: "Уведомления",
  partners: "Подрядчики",
  profile: "Профиль",
  settings: "Настройки",
  help: "Помощь",
  privacy: "Приватность",
};

const humanize = (segment: string) =>
  LABELS[segment] ?? segment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const AppBreadcrumb = () => {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const items = parts.map((segment, idx) => ({
      label: humanize(segment),
      href: "/" + parts.slice(0, idx + 1).join("/"),
      isLast: idx === parts.length - 1,
    }));
    return items;
  }, [pathname]);

  return (
    <Breadcrumb className="px-4 py-2 text-sm">
      <BreadcrumbList>
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage>Главная</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/">Главная</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((c) => (
          <Fragment key={c.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {c.isLast ? (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={c.href}>{c.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
