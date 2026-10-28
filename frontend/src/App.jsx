import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SafetyMonitoringPage } from './pages/SafetyMonitoringPage';
import { StructuralInspectionPage } from './pages/StructuralInspectionPage';
import { RealEstateValuationPage } from './pages/RealEstateValuationPage';
import { ProjectPlanningPage } from './pages/ProjectPlanningPage';
import { DailySiteAssistantPage } from './pages/DailySiteAssistantPage';
import { WeatherAwareAdvisoryPage } from './pages/WeatherAwareAdvisoryPage';
import { KnowledgeAssistantPage } from './pages/KnowledgeAssistantPage';
import { ReportsAnalysisPage } from './pages/ReportsAnalysisPage';
import { SettingsAboutPage } from './pages/SettingsAboutPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/safety" element={<SafetyMonitoringPage />} />
            <Route path="/structural" element={<StructuralInspectionPage />} />
            <Route path="/valuation" element={<RealEstateValuationPage />} />
            <Route path="/planning" element={<ProjectPlanningPage />} />
            <Route path="/assistant" element={<DailySiteAssistantPage />} />
            <Route path="/weather" element={<WeatherAwareAdvisoryPage />} />
            <Route path="/knowledge" element={<KnowledgeAssistantPage />} />
            <Route path="/reports" element={<ReportsAnalysisPage />} />
            <Route path="/settings" element={<SettingsAboutPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
