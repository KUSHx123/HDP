import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PredictionData } from '../types';

export const usePredictions = (userId: string) => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPredictions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();

    // Set up real-time subscription
    const channel = supabase
      .channel('predictions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setPredictions((current) => [payload.new as PredictionData, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Function to save a prediction
  const savePrediction = async (prediction: Omit<PredictionData, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .insert([{ ...prediction, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return { predictions, loading, error, savePrediction };
};
