import {useContext, useEffect, useState} from 'react';
import {BatchSetting} from './batch_setting.jsx';
import {
    ContextProvider,
    GameInfoContext,
    GameInfoSetterContext,
    SchemeDataSetterContext,
    SettingsSetterContext
} from './contexts.jsx';
import {NeedsList, NeedsListStorage} from './needs_list.jsx';
import {Result} from './result.jsx';
import {init_scheme_data, SchemeStorage} from './scheme_data.jsx';
import {Settings} from './settings.jsx';
import {
    default_game_data,
    game_data_info_list,
    get_game_data,
    get_mod_options,
    MoreMegaStructureGUID,
    TheyComeFromVoidGUID,
    vanilla_game_version
} from "./GameData.jsx";
import {Select} from "antd";

function GameVersion({needs_list, set_needs_list}) {
    const mod_options = get_mod_options();
    const set_game_data = useContext(GameInfoSetterContext);
    const set_scheme_data = useContext(SchemeDataSetterContext);
    const [mods, set_mods] = useState([]);
    const set_settings = useContext(SettingsSetterContext);

    async function mods_change(modList) {
        if (JSON.stringify(needs_list) !== '{}'
            && !confirm(`检测到计算器内有产线，确认继续切换mod吗？切换后将清空产线！`)) {
            return;// 用户取消
        }
        //清除原有产线，否则会出现找不到配方而导致白屏的bug
        set_needs_list({});
        //判断modList是否合理，并调整顺序
        //巨构是深空的前置依赖
        let b1 = false;
        let b2 = false;
        for (let i = 0; i < mods.length; i++) {
            if (mods[i] === MoreMegaStructureGUID) {
                b1 = true;
            }
            if (mods[i] === TheyComeFromVoidGUID) {
                b2 = true;
            }
        }
        let b3 = false;
        let b4 = false;
        for (let i = 0; i < modList.length; i++) {
            if (modList[i] === MoreMegaStructureGUID) {
                b3 = true;
            }
            if (modList[i] === TheyComeFromVoidGUID) {
                b4 = true;
            }
        }
        if (!b1 && !b2 && !b3 && b4) {
            modList.push(MoreMegaStructureGUID);
        }
        if (b1 && b2 && !b3 && b4) {
            modList = modList.filter((mod) => mod !== TheyComeFromVoidGUID);
        }
        //按照规定的顺序排序mods
        let modList2 = [];
        game_data_info_list.forEach((mod_info) => {
            for (let i = 0; i < modList.length; i++) {
                if (modList[i] === mod_info.GUID) {
                    modList2.push(mod_info.GUID);
                }
            }
        })
        //避免递归
        if (JSON.stringify(modList2) === JSON.stringify(mods)) {
            console.log("有递归，取消执行，当前list", modList2)
            return;
        }
        console.log("无递归，继续执行，原list", mods)
        console.log("无递归，继续执行，新list", modList2)
        set_mods(modList2);
        let game_data = modList.length === 0 ? default_game_data : get_game_data(modList);
        set_game_data(game_data);
        set_scheme_data(init_scheme_data(game_data));
        //根据创世是否启用，设定采矿速率初始值
        if (!game_data.GenesisBookEnable) {
            set_settings({"mining_speed_oil": 3.0});
            set_settings({"mining_speed_hydrogen": 1.0});
            set_settings({"mining_speed_deuterium": 0.2});
            set_settings({"mining_speed_gas_hydrate": 0.5});
        } else {
            set_settings({"mining_speed_oil": 3.0});
            set_settings({"mining_speed_hydrogen": 1.0});
            set_settings({"mining_speed_deuterium": 0.05});
            set_settings({"mining_speed_gas_hydrate": 0.8});
            set_settings({"mining_speed_helium": 0.02});
            set_settings({"mining_speed_ammonia": 0.3});
            set_settings({"mining_speed_nitrogen": 1.2});
            set_settings({"mining_speed_oxygen": 0.6});
            set_settings({"mining_speed_carbon_dioxide": 0.4});
            set_settings({"mining_speed_sulfur_dioxide": 0.6});
        }
    }

    return <div className="d-flex gap-2 align-items-center">
        <div className="text-nowrap">游戏版本 v{vanilla_game_version}</div>
        {/* <div className="text-nowrap">模组选择</div>
        <Select style={{minWidth: 250}} mode={"multiple"} options={mod_options} value={mods} onChange={mods_change}/> */}
    </div>;
}

function UserSettings({show}) {
    let class_show = show ? "" : "d-none";
    return <div className={`d-flex gap-3 ${class_show}`}>
        <fieldset>
            <legend><small>设置</small></legend>
            <Settings/>
        </fieldset>
    </div>;
}

function AppWithContexts() {
    const game_info = useContext(GameInfoContext);
    const [misc_show, set_misc_show] = useState(false);
    const [needs_list, set_needs_list] = useState({});
    useEffect(() => {
        set_needs_list({});
    }, [game_info]);

    function clearData() {
        if (!confirm(`即将清空所有保存的生产策略、需求列表等数据，初始化整个计算器，是否继续`)) {
            return;// 用户取消保存
        }
        localStorage.clear();
        window.location.reload();
    }

    return <>
        {/*游戏版本、模组选择*/}
        {/* <div className="d-flex column-gap-4 row-gap-2 flex-wrap">
            <GameVersion needs_list={needs_list} set_needs_list={set_needs_list}/>
        </div> */}
        {/*生产策略、需求列表、清空数据缓存按钮、采矿参数&其他设置是否显示按钮*/}
        {/* <div className="d-flex column-gap-4 row-gap-2 flex-wrap">
            <SchemeStorage/>
            <NeedsListStorage needs_list={needs_list} set_needs_list={set_needs_list}/>
            <button className="btn btn-outline-danger btn-sm" onClick={clearData}>清空数据缓存</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => set_misc_show(s => !s)}>
                采矿参数 & 其他设置
            </button>
        </div> */}
        {/*采矿参数&其他设置*/}
        <UserSettings show={misc_show}/>
        {/*添加需求、批量预设、计算结果*/}
        <div>
            <NeedsList needs_list={needs_list} set_needs_list={set_needs_list}/>
            <BatchSetting/>
            <Result needs_list={needs_list} set_needs_list={set_needs_list}/>
        </div>
    </>;
}

export default function App() {
    return <ContextProvider>
        <AppWithContexts/>
    </ContextProvider>;
}
