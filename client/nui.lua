local actions = {}           -- A table to store all the button actions
local menudata = {}          -- A table to store the menu data
local miscellaneousdata = {} -- A table to store misc data
local closing = false        -- A variable to check if the menu is closing and prevent spam and NUI focus bugs

function ClickSound()
    PlaySoundFrontend("SELECT", "HUD_SHOP_SOUNDSET", true, 0)
end

function BackSound()
    PlaySoundFrontend("BACK", "HUD_SHOP_SOUNDSET", true, 0)
end

function HoverSound()
    PlaySoundFrontend("NAV_RIGHT", "PAUSE_MENU_SOUNDSET", true, 0)
end

function DisplaySound(toggle)
    if toggle then
        PlaySoundFrontend("Leaderboard_Show", "MP_Leaderboard_Sounds", true, 0)
    else
        PlaySoundFrontend("Leaderboard_Hide", "MP_Leaderboard_Sounds", true, 0)
    end
end

function DisplayMenu(toggle)
    SetNuiFocus(toggle, toggle)
    SendNUIMessage({
        type = "DISPLAY",
        toggle = toggle
    })

    LocalPlayer.state:set("menuOpen", toggle, false)

    DisplaySound(toggle)

    if not toggle then
        actions = {}           -- Reset the actions table
        menudata = {}          -- Reset the menu data table
        miscellaneousdata = {} -- Reset the misc data table
        CreateThread(function()
            Wait(200)
            closing = true  -- Prevent spam
            Wait(1500)      -- prevent spam and nui bug
            closing = false -- Allow the menu to be opened again
        end)
    end
end

function DisplayMenuNoDataWipe(toggle)
    SetNuiFocus(toggle, toggle)
    SendNUIMessage({
        type = "DISPLAY",
        toggle = toggle
    })

    LocalPlayer.state:set("menuOpen", toggle, false)

    DisplaySound(toggle)
end

function SendMenuData(data, miscdata)
    SendNUIMessage({
        type = "SET_MENUDATA",
        menuData = data,
        miscData = miscdata
    })
end

exports('OpenMenu', function(menuData, internal)
    if closing then
        return TriggerEvent("redem_roleplay:Tip", "Please wait a moment.", 1000)
    end

    local JSMenuData
    local miscdata
    if menuData then
        miscdata = {}
        miscdata.align = menuData.align or "left"
        miscdata.closeButton = menuData.closeButton
        miscdata.searchBar = menuData.searchBar or false
        miscdata.title = menuData.title or "Menu"

        --[[ Remove unneeded values for JS read ]]
        menuData.align = nil
        menuData.closeButton = nil
        menuData.searchBar = nil
        menuData.title = nil

        JSMenuData = FormatData(menuData)
    end

    -- If the menu is internal, we don't need to send the data to the client
    if not internal then
        menudata = JSMenuData
        miscellaneousdata = miscdata
    else
        SendMenuData(menudata, miscellaneousdata)
        DisplayMenuNoDataWipe(true)
        return
    end

    SendMenuData(JSMenuData, miscdata)
    DisplayMenu(true)
end)

exports('CloseMenu', function(internal)
    if internal then
        DisplayMenuNoDataWipe(false)
        return
    end

    DisplayMenu(false)
end)

function FormatData(data)
    local formatted = {}

    if data.closeFunction then
        actions["close"] = data.closeFunction
        data.closeFunction = true
    end

    for index, item in ipairs(data) do
        local newItem = {
            name = item.name,
            image = item.image,
            context = item.context,
            id = math.random(1, 1000000000), -- unique ID
        }

        -- Soon...
        --[[ if item.requirements then
            for k, v in ipairs(item.requirements) do
                for item, data in pairs(exports.c_inventory:Items()) do
                    if v.item == data.name then
                        v.image = v.item .. ".png"
                        v.item = nil
                        break
                    end
                end
            end

            newItem.requirements = item.requirements
        end ]]

        if item.information then
            newItem.information = item.information
        end

        -- Add the function to our actions table
        if item.action then
            actions[newItem.id] = item.action
            newItem.action = true -- Indicate the button has an action
        end

        if item.form then
            newItem.form = item.form.fields
            newItem.submitLabel = item.form.submitLabel

            -- Add unique IDs to each form field button
            for k, v in ipairs(item.form.fields) do
                if v.type == "button" then
                    v.id = math.random(1, 1000000000)
                    local hoverId = v.id .. "_hover"
                    local clickId = v.id .. "_click"
                    actions[clickId] = v.action
                    actions[hoverId] = v.hoverAction
                end

                if v.type == "slider" then
                    for sliderid, sliderdata in ipairs(v.slideroptions) do
                        sliderdata.value = sliderdata.value or 0
                        sliderdata.sliderid = sliderdata.value
                        if sliderdata.action then
                            actions[sliderdata.sliderid .. "_slider"] = sliderdata.action
                            sliderdata.action = true
                        end
                    end

                    if v.generalFunction then
                        actions[v.id .. "_slider"] = v.generalFunction
                        v.generalFunction = true
                    end
                end
            end

            if item.form.submitAction then
                actions[newItem.id .. "_submit"] = item.form.submitAction
                newItem.submitAction = true
            end
        end

        if item.hoverAction then
            local hoverId = newItem.id .. "_hover"
            actions[hoverId] = item.hoverAction
            newItem.hoverAction = true
        end

        if item.subMenu then
            if item.backFunction then
                newItem.backFunction = true
                actions[newItem.id .. "_back"] = item.backFunction
            end

            newItem.subMenu = FormatData(item.subMenu) -- Recursively format submenu
        end

        table.insert(formatted, newItem)
    end

    return formatted
end

RegisterNUICallback('buttonClick', function(data)
    ClickSound()
    if data.id then
        local action = actions[data.id]
        if action then
            action(data.formData or nil)
        end
    end
end)

RegisterNUICallback('buttonHover', function(data)
    HoverSound()
    if data.id then
        local hoverAction = actions[data.id]
        if hoverAction then
            hoverAction()
        end
    end
end)

RegisterNUICallback('sliderChange', function(data)
    HoverSound()
    if data.id then
        local sliderAction = actions[data.id]; -- Now this will match the key sent from JavaScript

        if sliderAction then
            if data.sliderid then -- for general function
                sliderAction(data.sliderid)
                return
            end

            if sliderAction then -- for slider options
                sliderAction()
            end
        end
    end
end)

RegisterNUICallback('submitForm', function(data)
    ClickSound()
    if data.id then
        local action = actions[data.id .. "_submit"]
        if action then
            action(data.formData) -- Execute the associated submit action with the form data
        end
    end
end)

RegisterNUICallback('backButtonClick', function(data)
    BackSound()
    if data.id then
        local backAction = actions[data.id]
        if backAction then
            backAction()
        end
    end
end)

RegisterNUICallback('close', function(data, cb)
    local action = actions["close"]
    DisplayMenu(false)
    if action then
        action()
    end
    cb('ok')
end)
