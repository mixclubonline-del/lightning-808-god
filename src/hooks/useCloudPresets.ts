import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SharedPreset, PresetConfig } from "@/types/preset";
import { useToast } from "@/hooks/use-toast";

export const useCloudPresets = () => {
  const [cloudPresets, setCloudPresets] = useState<SharedPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCloudPresets = async (searchTerm?: string, category?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("shared_presets")
        .select("*")
        .order("downloads", { ascending: false })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCloudPresets((data || []) as unknown as SharedPreset[]);
    } catch (error) {
      console.error("Error fetching cloud presets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cloud presets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sharePreset = async (
    name: string,
    category: string,
    description: string,
    author: string,
    config: PresetConfig
  ) => {
    try {
      const { error } = await supabase.from("shared_presets").insert({
        name,
        category,
        description,
        author,
        config: config as any,
      });

      if (error) throw error;

      toast({
        title: "Preset Shared",
        description: "Your preset has been shared to the cloud",
      });

      fetchCloudPresets();
    } catch (error) {
      console.error("Error sharing preset:", error);
      toast({
        title: "Error",
        description: "Failed to share preset",
        variant: "destructive",
      });
    }
  };

  const downloadCloudPreset = async (presetId: string): Promise<PresetConfig | null> => {
    try {
      // Fetch the preset
      const { data, error } = await supabase
        .from("shared_presets")
        .select("*")
        .eq("id", presetId)
        .single();

      if (error) {
        console.error("Error fetching preset:", error);
        return null;
      }

      if (!data) return null;

      // Increment download count
      await supabase
        .from("shared_presets")
        .update({ downloads: data.downloads + 1 })
        .eq("id", presetId);

      toast({
        title: "Preset Downloaded",
        description: "Cloud preset loaded successfully",
      });

      return data.config as unknown as PresetConfig;
    } catch (error) {
      console.error("Error downloading preset:", error);
      toast({
        title: "Error",
        description: "Failed to download preset",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchCloudPresets();
  }, []);

  return {
    cloudPresets,
    loading,
    fetchCloudPresets,
    sharePreset,
    downloadCloudPreset,
  };
};
