import { Asset } from "./asset.model"
import { StateModel } from "./forecast-state.model"

export type SavedAssetGroupItem = {
    assets: Asset[],
    currentState: StateModel | null
}
