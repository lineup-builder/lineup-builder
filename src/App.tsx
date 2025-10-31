import { ConfirmationModal } from "./components/ConfirmationModal.tsx";
import { EventsSection } from "./features/lineup/EventsSection.tsx";
import { Header } from "./components/Header.tsx";
import { AthletePool } from "./features/lineup/AthletePool.tsx";
import { RosterManagement } from "./features/lineup/RosterManagement.tsx";
import { AthleteProfile } from "./features/lineup/AthleteProfile.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { useAuthContext } from "./components/auth/AuthProvider.tsx";
import { LoginPage } from "./components/auth/LoginPage.tsx";
import { TeamProvider } from "./components/TeamProvider.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

function App() {
  const { user, loading } = useAuthContext();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="lineup-theme">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="lineup-theme">
        <LoginPage />
      </ThemeProvider>
    );
  }

  // Show main app if authenticated
  return (
    <ThemeProvider defaultTheme="system" storageKey="lineup-theme">
      <TooltipProvider>
        <TeamProvider>
          <div className="bg-background text-foreground min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
              <Header />
              <div className="flex flex-col md:flex-row gap-8">
                <AthletePool />
                <EventsSection />
              </div>
              <RosterManagement />
              <AthleteProfile />
              <ConfirmationModal />
            </div>
          </div>
        </TeamProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
