module View exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Types exposing (..)


view : Model -> Html Msg
view model =
    div [ class "container-fluid" ]
        [ headerView model
        , mainView model
        ]


mainView : Model -> Html Msg
mainView model =
    div [ class "row" ]
        [ div [ class "col-sm-9" ]
            [ searchForm model.manual_version
            , case model.current_release of
                Nothing ->
                    div []
                        [ text "Learn more about a specific version. "
                        , strong [] [ text "Select or enter your version number." ]
                        ]

                Just version ->
                    dashboardView version model.release_status
            ]
        , div [ class "col-sm-3" ]
            [ releasesMenu model.releases ]
        ]


headerView : Model -> Html Msg
headerView model =
    nav
        [ class "navbar navbar-default" ]
        [ div
            [ class "container-fluid" ]
            [ div
                [ class "navbar-header" ]
                [ a [ class "navbar-brand", href "#" ] [ text "Delivery Dashboard" ] ]
            ]
        ]


releasesMenu : List Version -> Html Msg
releasesMenu releases =
    div [ class "panel panel-default" ]
        [ div [ class "panel-heading" ] [ strong [] [ text "Firefox Releases" ] ]
        , div []
            [ let
                releaseItem version =
                    li [] [ a [ onClick <| Select version ] [ text version ] ]
              in
                ul [] <|
                    List.map releaseItem releases
            ]
        ]


spinner : Html Msg
spinner =
    div [ class "loader" ] []


clearableTextInput : Msg -> List (Attribute Msg) -> String -> Html Msg
clearableTextInput onClearMsg attrs txt =
    div [ class "btn-group clearable-text" ]
        [ input attrs []
        , if String.length txt > 0 then
            span
                [ class "text-clear-btn"
                , onClick onClearMsg
                ]
                [ i [ class "glyphicon glyphicon-remove" ] [] ]
          else
            text ""
        ]


searchForm : String -> Html Msg
searchForm txt =
    Html.form [ class "search-form well", onSubmit <| Select txt ]
        [ clearableTextInput
            DismissVersion
            [ type_ "search"
            , class "form-control"
            , placeholder "Firefox version, eg. \"57.0\""
            , value txt
            , onInput ManualVersion
            ]
            txt
        ]


dashboardView : Version -> Maybe ReleaseStatus -> Html Msg
dashboardView version release_status =
    div []
        [ case release_status of
            Nothing ->
                spinner

            Just release_status ->
                div [] [ text <| toString release_status ]
        ]
