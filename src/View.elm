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
                    dashboardView version model
            ]
        , div [ class "col-sm-3" ]
            [ releasesMenu model.ongoing_versions ]
        ]


headerView : Model -> Html Msg
headerView model =
    nav
        [ class "navbar navbar-default" ]
        [ div
            [ class "container-fluid" ]
            [ div
                [ class "navbar-header" ]
                [ a [ class "navbar-brand", href "." ] [ text "Delivery Dashboard" ] ]
            ]
        ]


releasesMenu : Maybe OngoingVersions -> Html Msg
releasesMenu ongoing_versions =
    div [ class "panel panel-default" ]
        [ div [ class "panel-heading" ] [ strong [] [ text "Firefox Releases" ] ]
        , div []
            [ case ongoing_versions of
                Nothing ->
                    spinner

                Just ongoing_versions ->
                    let
                        releaseItem title version =
                            li [] [ a [ onClick <| Select version ] [ text <| title ++ ": " ++ version ] ]
                    in
                        ul []
                            [ releaseItem "Nightly" ongoing_versions.nightly
                            , releaseItem "Beta" ongoing_versions.beta
                            , releaseItem "Release" ongoing_versions.release
                            , releaseItem "ESR" ongoing_versions.esr
                            ]
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


dashboardView : Version -> Model -> Html Msg
dashboardView version model =
    div []
        [ table [ class "table table-stripped table-hover" ]
            [ thead []
                [ tr []
                    [ td []
                        [ h2 [] [ text "Archives" ]
                        , displayStatus model.archive
                        ]
                    , td []
                        [ h2 [] [ text "Product details" ]
                        , displayStatus model.product_details
                        ]
                    ]
                , tr []
                    [ td []
                        [ h2 [] [ text "Release Notes" ]
                        , displayStatus model.release_notes
                        ]
                    , td []
                        [ h2 [] [ text "Security Advisories" ]
                        , displayStatus model.security_advisories
                        ]
                    , td []
                        [ h2 [] [ text "Download links" ]
                        , displayStatus model.download_links
                        ]
                    ]
                ]
            ]
        ]


displayStatus : Maybe ReleaseStatus -> Html Msg
displayStatus release_status =
    case release_status of
        Nothing ->
            spinner

        Just release_status ->
            case release_status.status of
                Exists ->
                    a
                        [ class "label label-success"
                        , title <| Maybe.withDefault "" release_status.message
                        ]
                        [ text "Exists" ]

                Incomplete ->
                    a
                        [ class "label label-info"
                        , title <| Maybe.withDefault "" release_status.message
                        ]
                        [ text "Incomplete" ]

                Missing ->
                    a
                        [ class "label label-danger"
                        , title <| Maybe.withDefault "" release_status.message
                        ]
                        [ text "Missing" ]

                Error error ->
                    a
                        [ class "label label-warning"
                        , title <| Maybe.withDefault "" release_status.message
                        ]
                        [ text ("Error: " ++ error) ]
