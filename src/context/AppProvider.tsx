import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useSessionStorage from "../hooks/useSessionStorage";
import * as D from "../../constants";
import { getStageInfo, getFormulaForWeek, getParentLocationId } from '../services/nutritionService';
// ...resto igual